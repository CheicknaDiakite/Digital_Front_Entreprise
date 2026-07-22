import { FC } from 'react';
import AuthWrapper from './AuthWrapper';
import AuthRegister from './auth-forms/AuthRegister';

const Register: FC = () => {
  return (
    <AuthWrapper>
      <AuthRegister />
    </AuthWrapper>
  );
};

export default Register;
