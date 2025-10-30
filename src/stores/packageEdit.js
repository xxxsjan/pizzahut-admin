import { defineStore } from "pinia";

export const usePackageEditStore = defineStore("packageEdit", {
  state: () => {
    return {
      count: 0,
      goodsConfigs: {},
      packageData: {},
    };
  },
  actions: {
    increment() {
      this.count++;
    },
    setGoodsConfigs(goodsConfigs) {
      this.goodsConfigs = goodsConfigs;
    },
    pushGoodsConfig(key, value, s_linkId) {
      if (s_linkId) {
        this.goodsConfigs[s_linkId] = this.goodsConfigs[s_linkId] || {};
        this.goodsConfigs[s_linkId][key] = value;
      } else {
        this.goodsConfigs[key] = value;
      }
    },
    resetGoodsConfigs() {
      this.goodsConfigs = {};
    },
    setPackageData(packageData) {
      this.packageData = packageData;
    },
  },
});
