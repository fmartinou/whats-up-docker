const fs = require('fs/promises');
const { simpleGit } = require('simple-git');
const Trigger = require('../dockercompose/Dockercompose');
const store = require('../../../store');

function generateMessageForContainer(container) {
    return `${container.name}: ${container.image.tag.value} -> ${container.result.tag}`;
}

/**
 * Update a Docker compose stack with an updated one.
 */
class Git extends Trigger {
    /**
     * Get the Trigger configuration schema.
     * @returns {*}
     */
    getConfigurationSchema() {
        const schemaDocker = super.getConfigurationSchema();
        return schemaDocker.append({
            gitrepo: this.joi.string().required(),
            gitname: this.joi.string().optional().default('whats-up-docker'),
            gitemail: this.joi.string().optional().default('whats-up-docker@localhost'),
            gitbranch: this.joi.string().optional(),
        });
    }

    async checkoutBranch() {
        // Checks if we are already in the desired branch
        // If we aren't, checks if it exists
        // If it doesnt, creates it
        // If it does, checks it out
        const branch = this.configuration.gitbranch;
        await this.git.fetch(['--all']);
        const branchExists = await this.git.branch(['--all']);
        if (branchExists.current === branch) {
            this.log.info(`Already in branch ${branch}`);
            return;
        }
        if (branchExists.all.includes(`remotes/origin/${branch}`)) {
            this.log.info(`Branch ${branch} found, checking it out`);
            await this.git.checkout(branch);
        } else {
            this.log.info(`Branch ${branch} not found, creating it`);
            await this.git.checkoutLocalBranch(branch);
            // push new branch
            await this.git.push('origin', branch, ['-u']);
        }
    }

    async initTrigger() {
        // Force mode=batch to avoid docker-compose concurrent operations
        this.configuration.mode = 'batch';
        this.configuration.composeonly = true;
        // Check git Setup and clone repo

        const options = {
            baseDir: `${store.getConfiguration().path}/gitRepos/${this.name}`,
            binary: 'git',
            maxConcurrentProcesses: 6,
            trimmed: false,
        };

        try {
            await fs.mkdir(options.baseDir, { recursive: true });
        } catch (e) {
            this.log.error(`Error when creating baseDir (${e.message})`);
            throw e;
        }

        this.git = simpleGit(options);
        // check if repo is already cloned
        try {
            const isRepo = await this.git.checkIsRepo('root');
            if (isRepo) {
                this.log.info('Repo already cloned');
                // fetch
                await this.git.fetch();
                // check if branch is set
                if (this.configuration.gitbranch) {
                    this.log.info('Checking out branch');
                    await this.checkoutBranch();
                }
                // pull
                await this.git.pull();
            } else {
                this.log.info('Cloning repo');
                await this.git.clone(this.configuration.gitrepo, './');
                // check if branch is set
                if (this.configuration.gitbranch) {
                    this.log.info('Checking out branch');
                    await this.checkoutBranch();
                }
            }
        } catch (e) {
            this.log.error(`Error when cloning/updating repo (${e.message})`);
            throw e;
        }
        await this.git.addConfig('user.name', this.configuration.gitname);
        await this.git.addConfig('user.email', this.configuration.gitemail);
        // when setting all options in a single object

        // Check docker-compose file is found

        try {
            await fs.access(`${options.baseDir}/${this.configuration.file}`);
        } catch (e) {
            this.log.error(`The file ${this.configuration.file} does not exist`);
            throw e;
        }
        this.configuration.file = `${options.baseDir}/${this.configuration.file}`;
    }

    /**
     * Update the docker-compose stack.
     * @param containers the containers
     * @returns {Promise<void>}
     */
    async triggerBatch(containers) {
        await super.triggerBatch(containers);

        // Build Commit message based on tags

        let msg = '';
        if (containers.length > 1) {
            msg += 'Batch Update \n';
            containers.forEach((container) => {
                msg += generateMessageForContainer(container);
                msg += '\n';
            });
        } else {
            msg += generateMessageForContainer(containers[0]);
        }

        // Create commit
        try {
            await this.git.add('.');
            await this.git.commit(msg);
            await this.git.push();
        } catch (e) {
            this.log.error(`Error when commiting/pushing repo (${e.message})`);
            throw e;
        }
    }
}

module.exports = Git;
