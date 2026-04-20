import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as github from '@actions/github';

interface LintResult {
  issuesFound: number;
  hasErrors: boolean;
  output: string;
  summary: string;
}

async function run(): Promise<void> {
  try {
    // Get inputs
    const configPath = core.getInput('config-path') || '.chous';
    const verbose = core.getInput('verbose') === 'true';
    const strict = core.getInput('strict') === 'true';
    const autoFix = core.getInput('auto-fix') === 'true';
    const failOnError = core.getInput('fail-on-error') === 'true';
    const commentOnPr = core.getInput('comment-on-pr') === 'true';
    const githubToken = core.getInput('github-token');

    core.info('🚀 Running Chous file structure linter...');

    // Install chous if not available
    await installChous();

    // Run linting
    const lintResult = await runLint(configPath, verbose, strict);

    // Run auto-fix if enabled
    if (autoFix && lintResult.issuesFound > 0) {
      core.info('🔧 Running auto-fix...');
      await runFix();

      // Re-run lint to get updated results
      const fixedResult = await runLint(configPath, verbose, strict);

      if (fixedResult.issuesFound < lintResult.issuesFound) {
        core.info(`✓ Fixed ${lintResult.issuesFound - fixedResult.issuesFound} issue(s)`);
      }
    }

    // Set outputs
    core.setOutput('issues-found', lintResult.issuesFound.toString());
    core.setOutput('has-errors', lintResult.hasErrors.toString());
    core.setOutput('summary', lintResult.summary);

    // Create summary
    await createSummary(lintResult);

    // Comment on PR if enabled
    if (commentOnPr && github.context.payload.pull_request && githubToken) {
      await commentOnPR(githubToken, lintResult);
    }

    // Fail if needed
    if (failOnError && lintResult.issuesFound > 0) {
      core.setFailed(`Found ${lintResult.issuesFound} file structure issue(s)`);
    } else if (lintResult.issuesFound === 0) {
      core.info('✓ No file structure issues found!');
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unknown error occurred');
    }
  }
}

async function installChous(): Promise<void> {
  try {
    // Check if chous is already installed
    await exec.exec('npx', ['chous', '--help'], { silent: true });
    core.info('✓ Chous is available');
  } catch {
    core.info('Installing chous...');
    await exec.exec('npm', ['install', '-g', 'chous']);
    core.info('✓ Chous installed');
  }
}

async function runLint(
  configPath: string,
  verbose: boolean,
  strict: boolean
): Promise<LintResult> {
  let output = '';
  let errorOutput = '';

  const options: exec.ExecOptions = {
    ignoreReturnCode: true,
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
      stderr: (data: Buffer) => {
        errorOutput += data.toString();
      },
    },
  };

  const args = ['chous'];
  if (configPath !== '.chous') {
    args.push('--config', configPath);
  }
  if (verbose) {
    args.push('--verbose');
  }
  if (strict) {
    args.push('--strict');
  }

  const exitCode = await exec.exec('npx', args, options);

  // Parse output to count issues
  const lines = output.split('\n');
  let issuesFound = 0;
  let hasErrors = false;

  for (const line of lines) {
    if (line.includes('error') || line.includes('✗')) {
      issuesFound++;
      hasErrors = true;
    } else if (line.includes('warning') || line.includes('⚠')) {
      issuesFound++;
    }
  }

  // If exit code is non-zero, there are issues
  if (exitCode !== 0 && issuesFound === 0) {
    issuesFound = 1;
    hasErrors = true;
  }

  const summary = issuesFound === 0
    ? '✓ No file structure issues found'
    : `Found ${issuesFound} file structure issue(s)`;

  return {
    issuesFound,
    hasErrors,
    output: output || errorOutput,
    summary,
  };
}

async function runFix(): Promise<void> {
  const options: exec.ExecOptions = {
    ignoreReturnCode: true,
  };

  await exec.exec('npx', ['chous', 'fix', '--yes'], options);
}

async function createSummary(result: LintResult): Promise<void> {
  await core.summary
    .addHeading('Chous File Structure Linter')
    .addRaw(result.summary)
    .addBreak()
    .addDetails('Linting Output', `\`\`\`\n${result.output}\n\`\`\``)
    .write();
}

async function commentOnPR(token: string, result: LintResult): Promise<void> {
  const octokit = github.getOctokit(token);
  const { context } = github;

  if (!context.payload.pull_request) {
    return;
  }

  const prNumber = context.payload.pull_request.number;

  let commentBody = '## 📁 Chous File Structure Linter\n\n';

  if (result.issuesFound === 0) {
    commentBody += '✅ **No file structure issues found!**\n\n';
    commentBody += 'Your project structure follows all the defined conventions.';
  } else {
    commentBody += `⚠️ **Found ${result.issuesFound} file structure issue(s)**\n\n`;
    commentBody += '<details>\n<summary>View Details</summary>\n\n';
    commentBody += '```\n' + result.output + '\n```\n\n';
    commentBody += '</details>\n\n';
    commentBody += '💡 **Tip**: Run `chous fix` locally to automatically fix some of these issues.';
  }

  commentBody += '\n\n---\n';
  commentBody += '*Powered by [Chous](https://github.com/apus3404-oss/chous)*';

  try {
    // Check if we already commented
    const { data: comments } = await octokit.rest.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: prNumber,
    });

    const existingComment = comments.find(
      (comment) =>
        comment.user?.type === 'Bot' &&
        comment.body?.includes('Chous File Structure Linter')
    );

    if (existingComment) {
      // Update existing comment
      await octokit.rest.issues.updateComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        comment_id: existingComment.id,
        body: commentBody,
      });
      core.info('✓ Updated PR comment');
    } else {
      // Create new comment
      await octokit.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: prNumber,
        body: commentBody,
      });
      core.info('✓ Created PR comment');
    }
  } catch (error) {
    core.warning(`Failed to comment on PR: ${error}`);
  }
}

run();
