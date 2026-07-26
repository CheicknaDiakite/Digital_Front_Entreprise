// assets
import { LoginOutlined, ProfileOutlined } from '@ant-design/icons';

// icons
const icons = {
  LoginOutlined,
  ProfileOutlined
};

// ==============================|| MENU ITEMS - EXTRA PAGES ||============================== //

const pages = {
  id: 'authentication',
  title: 'Compte',
  type: 'group',
  children: [
    {
      id: 'login1',
      title: 'Connexion',
      type: 'item',
      url: '/auth/login',
      icon: icons.LoginOutlined,
      target: true
    },
    {
      id: 'register1',
      title: 'Créer un compte',
      type: 'item',
      url: '/auth/register',
      icon: icons.ProfileOutlined,
      target: true
    }
  ]
};

export default pages;
