import axios from "axios";
import { environment } from "./environment";
import { APIResponse } from "./interfaces";

const headers = {
  "Content-Type": "application/json"
};

export class WalletsService {
  private APIURL = environment.APIURL;

  async newWallet(prop: { address: string }) {
    return axios.post<any, APIResponse>(`${this.APIURL}/wallets`, prop, { headers });
  }

  async getWallets(prop: { orderBy: "creationTS" | "isFavorite" }) {
    return axios.get<any, APIResponse>(`${this.APIURL}/wallets`, { params: prop, headers });
  }

  async getWallet(prop: { address: string }) {
    return axios.get<any, APIResponse>(`${this.APIURL}/wallets/${prop.address}`, { headers });
  }

  async setFavorite(prop: { address: string; isFavorite: boolean }) {
    return axios.patch<any, APIResponse>(`${this.APIURL}/wallets/${prop.address}/favorite`, prop, { headers });
  }
}
