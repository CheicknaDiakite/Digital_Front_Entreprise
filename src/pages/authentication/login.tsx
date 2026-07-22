import { FC } from 'react';
import AuthWrapper from './AuthWrapper';
import AuthLogin from './auth-forms/AuthLogin';

const Login: FC = () => {
  return (
    <AuthWrapper>
      <AuthLogin />
    </AuthWrapper>
  );
};

export default Login;
