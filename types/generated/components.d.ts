import type { Schema, Attribute } from '@strapi/strapi';

export interface ComCommentaires extends Schema.Component {
  collectionName: 'components_com_commentaires';
  info: {
    displayName: 'Commentaires';
    icon: 'discuss';
  };
  attributes: {
    auteur: Attribute.String & Attribute.Required;
    texte: Attribute.Text & Attribute.Required;
  };
}

export interface NavigationMenuItem extends Schema.Component {
  collectionName: 'components_navigation_menu_items';
  info: {
    displayName: 'menu-item';
    icon: 'bulletList';
    description: '';
  };
  attributes: {
    label: Attribute.String & Attribute.Required;
    route: Attribute.String & Attribute.Required;
    order: Attribute.Integer & Attribute.DefaultTo<0>;
    children: Attribute.Component<'navigation.sub-menu', true>;
  };
}

export interface NavigationSubMenu extends Schema.Component {
  collectionName: 'components_navigation_sub_menus';
  info: {
    displayName: 'SubMenu';
    icon: 'bulletList';
  };
  attributes: {
    order: Attribute.Integer;
    label: Attribute.String;
    route: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'com.commentaires': ComCommentaires;
      'navigation.menu-item': NavigationMenuItem;
      'navigation.sub-menu': NavigationSubMenu;
    }
  }
}
