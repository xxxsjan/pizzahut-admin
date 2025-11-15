import { defineStore } from "pinia";
import { getProductDetail } from "@/api";
import { message } from "ant-design-vue";

export const usePackageEditStore = defineStore("packageEdit", {
  state: () => {
    return {
      count: 0,
      goodsConfigs: {},
      packageData: {},
      draftConfig: {},
      openPackageList: [],
      curOpenLinkId: "",
      goodsConfigsList: [],
      dialog: {
        isOpen: false,
        currentProduct: {},
      },
    };
  },
  actions: {
    increment() {
      this.count++;
    },
    setGoodsConfigs(goodsConfigs = {}) {
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
      this.openPackageList = [];
    },
    setPackageData(packageData) {
      this.packageData = packageData;
    },

    pushDraftConfig(key, value) {
      this.draftConfig[key] = value;
    },
    mergeDraftConfig(p_s_linkId, tdComboContentInfos) {
      console.log("tdComboContentInfos: ", tdComboContentInfos);
      const draftConfigMap = JSON.parse(JSON.stringify(this.draftConfig));
      // 价格
      tdComboContentInfos.forEach((item, idx) => {
        const tdComboContentInfo = item.tdComboContentInfo || [];
        tdComboContentInfo.map((m) => {
          const linkId = m.linkId;
          const key = `${idx}_${linkId}`;
          if (m.price !== undefined) {
            draftConfigMap[key] = draftConfigMap[key] || {};
            draftConfigMap[key].price = m.price;
          }
        });
      });
      console.log("draftConfigMap: ", draftConfigMap);
      this.goodsConfigs[p_s_linkId] = {
        ...this.goodsConfigs[p_s_linkId],
        ...draftConfigMap,
      };
    },

    openEditDialog(linkId) {
      getProductDetail({
        linkId: linkId,
      }).then((res) => {
        if (!res.data?.root) {
          console.log("res.dat: ", res);
          message.warn(res.data.message || "获取商品详情失败");
          return;
        }
        this.dialog.currentProduct = res || {};
        // tdComboContentInfos.value = root.tdComboContentInfos || [];
        this.dialog.isOpen = true;
      });
    },
    closeEditDialog() {
      this.dialog.isOpen = false;
      this.dialog.currentProduct = {};
    },
    updateProduct(updatedProduct) {
      const index = this.productList.findIndex(
        (p) => p.id === updatedProduct.id
      );
      if (index !== -1) {
        this.productList[index] = {
          ...this.productList[index],
          ...updatedProduct,
        };
      }
    },
  },
});
