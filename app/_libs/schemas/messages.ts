// Shared validation copy: say what to do ("Enter a name"), not what's wrong
// ("Name is required field").

/** Longest workspace, project or person name the forms accept. */
export const NAME_MAX_LENGTH = 64;

const article = (noun: string) => (/^[aeiou]/i.test(noun) ? 'an' : 'a');

export const VALIDATION_MESSAGES = {
    name: 'Enter a name',
    workspaceName: 'Enter a workspace name',
    projectName: 'Enter a project name',
    fullName: 'Enter your name',
    title: 'Enter a title',
    /** Your own email (sign-in). */
    email: 'Enter your email address',
    /** Someone else's email (invites, sharing). */
    inviteEmail: 'Enter an email address',
    emailInvalid: 'That doesn’t look like a valid email',
    url: 'Enter a valid URL',
    date: 'Choose a date',
    member: 'Choose a member',
    tooLong: (max: number) => `Use ${max} characters or fewer`,
    /** "Choose a project", "Choose an organization". */
    choose: (noun: string) => `Choose ${article(noun)} ${noun}`
};
