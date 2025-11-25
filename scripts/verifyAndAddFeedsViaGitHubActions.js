import core from '@actions/core';
import github from '@actions/github';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { v7 as uuidv7 } from 'uuid';

async function run() {
    try {
        console.log('Starting the feed verification and addition process...');
        const token = core.getInput('github-token');
        console.log('GitHub token acquired.', token);
        const octokit = github.getOctokit(token);
        const context = github.context;

        // Ensure we are in the context of an issue being opened or edited
        if (context.eventName !== 'issues' || !['opened', 'edited'].includes(context.payload.action)) {
            core.info('Action is not running on a newly opened or edited issue. Skipping.');
            return;
        }

        const issue = context.payload.issue;

        // Check for the 'verify' label
        const hasVerifyLabel = issue.labels.some(label => label.name === 'verify');
        if (!hasVerifyLabel) {
            core.info('Issue does not have the "verify" label. Skipping.');
            return;
        }

        const issueBody = issue.body || '';
        const { owner, repo } = context.repo;
        const issueNumber = issue.number;

        // 1. Find an OPML or a simple RSS/Atom feed URL in the issue body
        const urlRegex = /(https?:\/\/[^\s)]+\.(opml|xml|rss|atom)|https?:\/\/[^\s)]+\/feed)/;
        const match = issueBody.match(urlRegex);

        if (!match) {
            core.info('No OPML or RSS feed URL found in the issue body. Skipping.');
            return;
        }

        const feedUrl = match[0];
        core.info(`Found URL: ${feedUrl}`);

        let newFeedUrls = [];

        // 2. Extract feed URLs from the source (OPML or single feed)
        if (feedUrl.endsWith('.opml')) {
            core.info('Processing OPML file...');
            try {
                const response = await fetch(feedUrl);
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }
                const opmlContent = await response.text();
                const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
                const opml = parser.parse(opmlContent);
                const outlines = opml.opml?.body?.outline || [];
                const outlinesArray = Array.isArray(outlines) ? outlines : [outlines];

                for (const outline of outlinesArray) {
                    if (outline['@_type'] === 'rss' && outline['@_xmlUrl']) {
                        newFeedUrls.push(outline['@_xmlUrl']);
                    }
                }
            } catch (error) {
                throw new Error(`Failed to fetch or parse OPML file from ${feedUrl}: ${error.message}`);
            }
        } else {
            core.info('Processing as a single RSS/Atom feed.');
            newFeedUrls.push(feedUrl);
        }

        if (newFeedUrls.length === 0) {
            throw new Error('Could not extract any feed URLs from the provided link.');
        }

        core.info(`Extracted ${newFeedUrls.length} potential new feed(s).`);

        // 3. Get the existing feedlist.json from the repository
        const feedlistPath = 'src/data/feedlist.json';
        const { data: existingFile } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: feedlistPath,
        });

        const existingFeedsContent = Buffer.from(existingFile.content, 'base64').toString('utf8');
        const existingFeedList = JSON.parse(existingFeedsContent);

        const existingFeedUrlSet = new Set(existingFeedList.map(feed => feed.url));

        // 4. Filter out duplicates
        const uniqueNewFeeds = newFeedUrls.filter(url => !existingFeedUrlSet.has(url));

        if (uniqueNewFeeds.length === 0) {
            core.info('No new feeds to add. All provided feeds are already in feedlist.json.');
            await octokit.rest.issues.createComment({
                owner,
                repo,
                issue_number: issueNumber,
                body: '✅ Thank you for your submission! All feeds from the provided link are already on our list.',
            });
            return;
        }

        core.info(`Found ${uniqueNewFeeds.length} new unique feeds to add.`);

        // 5. Create a new branch, commit the updated file, and open a PR
        const newBranchName = `feat/add-feeds-issue-${issueNumber}`;
        const mainBranch = await octokit.rest.repos.getBranch({ owner, repo, branch: 'main' });
        const mainBranchSha = mainBranch.data.commit.sha;

        await octokit.rest.git.createRef({
            owner,
            repo,
            ref: `refs/heads/${newBranchName}`,
            sha: mainBranchSha,
        });
        core.info(`Created new branch: ${newBranchName}`);

        const newFeedObjects = uniqueNewFeeds.map(url => ({
            id: uuidv7(), // Use uuidv7() to generate ID
            url: url,
        }));

        const updatedFeedList = [...existingFeedList, ...newFeedObjects];
        const updatedContent = JSON.stringify(updatedFeedList, null, 2) + '\n';

        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: feedlistPath,
            message: `feat: Add ${uniqueNewFeeds.length} new feed(s) from issue #${issueNumber}`,
            content: Buffer.from(updatedContent).toString('base64'),
            sha: existingFile.sha,
            branch: newBranchName,
        });
        core.info('Committed the updated feedlist.json.');

        const pr = await octokit.rest.pulls.create({
            owner,
            repo,
            title: `Add ${uniqueNewFeeds.length} new feed(s) from Issue #${issueNumber}`,
            head: newBranchName,
            base: 'main',
            body: `This PR automatically adds **${uniqueNewFeeds.length}** new feed(s) submitted in #${issueNumber}.

**New Feeds:**
${uniqueNewFeeds.map(url => `- \`${url}\``).join('\n')}

Closes #${issueNumber}.`,
        });
        core.info(`Created Pull Request: ${pr.data.html_url}`);

        await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: issueNumber,
            body: `🚀 Thank you for your contribution! I've opened a pull request to add the new feed(s): **${pr.data.html_url}**`,
        });

    } catch (error) {
        core.setFailed(error.message);
        const issueNumber = github.context.payload.issue?.number;
        if (issueNumber) {
            const { owner, repo } = github.context.repo;
            const octokit = github.getOctokit(core.getInput('github-token'));
            await octokit.rest.issues.createComment({
                owner,
                repo,
                issue_number: issueNumber,
                body: `❌ An error occurred while processing your submission. Please check the URL and try again.\n\n**Error:**\n\`\`\`\n${error.message}\n\`\`\``,
            });
        }
    }
}

run();
