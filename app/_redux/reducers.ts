'use client';
import { combineReducers } from '@reduxjs/toolkit';
import { loginSlice, loginUserSlice } from './slices/auth';
import { bugActivityLogSlice } from './slices/bugActivityLog';
import { bugCommentSlice } from './slices/bugComment';
import { gettingStartedSlice } from './slices/gettingStarted';
import { memberSlice } from './slices/members';
import { projectSlice } from './slices/project';
import { projectintegrationSlice } from './slices/projectIntegration';
import { reactionSlice } from './slices/reactions';
import { recordingLinkSlice } from './slices/recordingLink';
import { sessionDetailsSlice } from './slices/sessionDetails';
import { sessionSlice } from './slices/sessions';
import { workSpaceSlice } from './slices/workspace';
import { workspaceActiveMemberSlice } from './slices/workspaceActiveMember';
import { workspaceIntegrationSlice } from './slices/workspaceIntegrations';
import { workspaceTransactionHistorySlice } from './slices/workspaceTransactionHistory';

// Same state keys as bb-app; every bb-app slice is here.
const rootReducer = combineReducers({
    login: loginSlice.reducer,
    loginUser: loginUserSlice.reducer,
    sessions: sessionSlice.reducer,
    projectIntegration: projectintegrationSlice.reducer,
    workspaceIntegration: workspaceIntegrationSlice.reducer,
    member: memberSlice.reducer,
    workspace: workSpaceSlice.reducer,
    project: projectSlice.reducer,
    bugComment: bugCommentSlice.reducer,
    bugActivityLog: bugActivityLogSlice.reducer,
    reactions: reactionSlice.reducer,
    sessionDetails: sessionDetailsSlice.reducer,
    workspaceActiveMember: workspaceActiveMemberSlice.reducer,
    workspaceTransactionHistory: workspaceTransactionHistorySlice.reducer,
    recordingLink: recordingLinkSlice.reducer,
    gettingStarted: gettingStartedSlice.reducer
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
