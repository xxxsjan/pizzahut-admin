import { defineStore } from "pinia";

export const usePackageEditStore = defineStore("packageEdit", {
  state: () => {
    return {
      count: 0,
      goodsConfigs: {},
      packageData: {},
      draftConfig: {},
      openPackageList: [],
      curOpenLinkId: "",
    };
  },
  actions: {
    increment() {
      this.count++;
    },
    setGoodsConfigs(goodsConfigs) {
      this.goodsConfigs = goodsConfigs;
    },
    pushGoodsConfig(key, value, p_s_linkId) {
      if (p_s_linkId) {
        this.goodsConfigs[p_s_linkId] = this.goodsConfigs[p_s_linkId] || {};
        this.goodsConfigs[p_s_linkId][key] = value;
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
    setDraftConfig(draftConfig) {
      this.draftConfig = draftConfig;
    },
    pushDraftConfig(key, value) {
      this.draftConfig[key] = value;
    },
    mergeDraftConfig(p_s_linkId) {
      this.goodsConfigs[p_s_linkId] = {
        ...this.goodsConfigs[p_s_linkId],
        ...this.draftConfig,
      };
    },
  },
});
