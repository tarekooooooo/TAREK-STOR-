import { Product } from "../types";

export type StoreStackParamList = {
  Products: undefined;
  ProductDetail: { product: Product };
};

export type SupportStackParamList = {
  Tickets: undefined;
  TicketChat: { ticketId: string; subject: string };
};

export type MainTabParamList = {
  StoreTab: undefined;
  CartTab: undefined;
  WalletTab: undefined;
  SupportTab: undefined;
  ProfileTab: undefined;
};
