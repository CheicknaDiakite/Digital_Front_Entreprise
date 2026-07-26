// assets
import { QuestionOutlined } from '@ant-design/icons';

// icons
const icons = {
  QuestionOutlined
};

// ==============================|| MENU ITEMS - SAMPLE PAGE & DOCUMENTATION ||============================== //

const support = {
  id: 'support',
  title: 'Support',
  type: 'group',
  children: [
    {
      id: 'documentation',
      title: 'Documentation Gest Stocks',
      type: 'item',
      url: 'https://documentation.gest-stocks.com',
      icon: icons.QuestionOutlined,
      external: true,
      target: true
    }
  ]
};

export default support;
