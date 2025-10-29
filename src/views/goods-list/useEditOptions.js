import { ref } from "vue";
import { message } from "ant-design-vue";

import {
  getProductDetail,
  updateEnabledOptions,
  getEnabledOptions,
} from "@/api";
const cleanGroupName = (name) => {
  return (name || "").replace(/\d+/g, "");
};
const buildSpecOptions = (specs, enabledOptions, menus) => {
  const allLinkIds = specs[0].specDetails
    .map((m) => m.linkIds)
    .flatMap((f) => f);
  // const alltdProductDosingGroupInfos = allLinkIds
  //   .map((m) => menus[m])
  //   .map((m) => m.tdProductDosingGroupInfos)
  //   .flatMap((f) => f);
  const firsttdProductDosingGroupInfos = allLinkIds
    .map((m) => menus[m])
    .map((m) => m.tdProductDosingGroupInfos)[0];

  const res = [
    ...specs.map((m) => ({
      groupName: m.specName,
      options: (m.specDetails || []).map((mp) => ({
        value: mp.specLabel,
        label: mp.specLabel,
      })),
      value: enabledOptions[cleanGroupName(m.specName)] || [],
    })),
    ...firsttdProductDosingGroupInfos.map((m) => ({
      groupName: m.keyDosingGroupName,
      options: (m.productDosingDetails || []).map((mp) => ({
        value: mp.keyName,
        label: mp.keyName,
      })),
      value: enabledOptions[cleanGroupName(m.keyDosingGroupName)] || [],
    })),
  ];

  return res;
};

const buildDosingOptions = (dosingGroups, enabledOptions) => {
  return dosingGroups.map((m) => ({
    groupName: m.keyDosingGroupName,
    options: (m.productDosingDetails || []).map((mp) => ({
      value: mp.keyName,
      label: mp.keyName,
    })),
    value: enabledOptions[cleanGroupName(m.keyDosingGroupName)] || [],
  }));
};
export const useEditOptions = () => {
  const editOptionData = ref({
    optionsList: [],
    productGroupName: "",
    linkId: "",
  });
  const editOptionsModalVisible = ref(false);

  const handleEditOptions = async (record) => {
    const res = await getProductDetail({
      // token: "",
      // thirdId: generateRandomString(),
      // storeCode: "WHN833",
      linkId: record.linkId,
      // filter_mode: false,
    });
    if (res.code === 0) {
      console.log("res: ", res.data);
      const isSpec = Boolean(res.data.root?.groupSpec?.length);
      const isDosing = Boolean(
        res.data.root?.tdProductDosingGroupInfos?.length
      );
      const isMenu = res.data.root?.menuType === "mealItems";
      const noData = !res.data.root || (!isSpec && !isDosing);

      if (noData || isMenu) {
        message.error("该商品不支持自定义添加");
        return;
      }
      const res2 = await getEnabledOptions({
        linkId: record.linkId,
      });

      const enabled_options = res2.data.enabled_options || {};
      let optionsList = [];

      if (isSpec) {
        console.log("res.data.root.groupSpec: ", res.data.root.groupSpec);
        optionsList = buildSpecOptions(
          res.data.root.groupSpec,
          enabled_options,
          res.data.menus
        );
        console.log("optionsList: ", optionsList);
      } else if (isDosing) {
        optionsList = buildDosingOptions(
          res.data.root.tdProductDosingGroupInfos,
          enabled_options
        );
      }
      console.log(optionsList);
      editOptionData.value = {
        optionsList,
        productGroupName:
          res.data.root.productGroupName || res.data.root.cnName,
        linkId: res.data.root.linkId,
      };
      editOptionsModalVisible.value = true;
    } else {
      message.error("获取商品详情失败");
    }
  };
  const handleEditOptionsSubmit = async () => {
    //   {
    //   "linkId": "500005401",
    //   "enabled_options": {
    //     "饼底": ["铁盘", "手拍"],
    //     "尺寸": ["普装"],
    //     "配料": ["免费芝士"],
    //     "蘸酱": ["番茄酱", "芥末蛋黄风味酱"]
    //   }
    // }
    const params = {
      linkId: editOptionData.value.linkId,
      enabled_options: editOptionData.value.optionsList.reduce((pre, cur) => {
        const groupName = (cur.groupName || "").replace(/\d+/g, "");
        pre[groupName] = cur.value || [];
        return pre;
      }, {}),
    };
    console.log("params: ", params);
    debugger;
    try {
      const res = await updateEnabledOptions(params).catch((err) => {
        console.log("err: ", err);
        message.error(err.toString() || "更新失败");
      });
      if (res.code === 0) {
        message.success(res.message || "更新成功");
        editOptionsModalVisible.value = false;
      }
    } catch (error) {}
  };
  return {
    editOptionData,
    editOptionsModalVisible,
    handleEditOptions,
    handleEditOptionsSubmit,
  };
};
