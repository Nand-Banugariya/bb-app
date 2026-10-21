import * as Yup from 'yup';
import { VALIDATION_MESSAGES } from './messages';

export interface LoginFormInputs {
    email: string;
}

export const LoginFormValidateSchema: Yup.ObjectSchema<LoginFormInputs> = Yup.object({
    email: Yup.string()
        .trim()
        .email(VALIDATION_MESSAGES.emailInvalid)
        .required(VALIDATION_MESSAGES.email)
}).required();
