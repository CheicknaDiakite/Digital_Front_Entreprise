// assets
import {
  AppstoreAddOutlined,
  AntDesignOutlined,
  BarcodeOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  LoadingOutlined
} from '@ant-design/icons';

// icons
const icons = {
  FontSizeOutlined,
  BgColorsOutlined,
  BarcodeOutlined,
  AntDesignOutlined,
  LoadingOutlined,
  AppstoreAddOutlined
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const utilities = {
  id: 'utilities',
  title: 'Gestion',
  type: 'group',
  children: [
    {
      id: 'categories',
      title: 'Articles',
      type: 'item',
      url: '/categorie',
      icon: icons.FontSizeOutlined
    },
    {
      id: 'entrees',
      title: 'Entrées',
      type: 'item',
      url: '/entre',
      icon: icons.BgColorsOutlined
    },
    {
      id: 'sorties',
      title: 'Sorties',
      type: 'item',
      url: '/sortie',
      icon: icons.BarcodeOutlined
    }
  ]
};

export default utilities;
