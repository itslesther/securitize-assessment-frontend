import axios from "axios";
import { environment } from "./environment";
import { APIResponse } from "./interfaces";

const headers = {
  "Content-Type": "application/json",
};

export class RatesService {
  private APIURL = environment.APIURL;

  async updateRate(prop: { fiat: string; value: number }) {
    return axios.patch<any, APIResponse>(`${this.APIURL}/rates`, prop, { headers });
  }

  async getRates() {
    return axios.get<any, APIResponse>(`${this.APIURL}/rates`, { headers });
  }
}