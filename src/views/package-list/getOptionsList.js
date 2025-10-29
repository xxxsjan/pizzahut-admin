import { getProductDetail } from "@/api";
import { message } from "ant-design-vue";

export const cleanGroupName = (name) => {
  return (name || "").replace(/\d+/g, "");
};
const buildSpecOptions = (specs, enabledOptions, menus) => {
  const allLinkIds = specs[0].specDetails
    .map((m) => m.linkIds)
    .flatMap((f) => f);

  const firsttdProductDosingGroupInfos = allLinkIds
    .map((m) => menus[m])
    .map((m) => m.tdProductDosingGroupInfos)[0];

  const res = [
    ...specs.map((m) => ({
      groupName: m.specName,
      options: (m.specDetails || []).map((mp) => ({
        value: mp.specLabel,
        label: mp.specLabel,
        price: mp.price || 0,
      })),
      value: enabledOptions[cleanGroupName(m.specName)] || [],
    })),
    ...firsttdProductDosingGroupInfos.map((m) => ({
      groupName: m.keyDosingGroupName,
      options: (m.productDosingDetails || []).map((mp) => ({
        value: mp.keyName,
        label: mp.keyName,
        price: mp.price || 0,
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
      price: mp.price || 0,
    })),
    value: enabledOptions[cleanGroupName(m.keyDosingGroupName)] || [],
  }));
};

export const getOptionsList = async (linkId) => {
  const res = await getProductDetail({
    linkId: linkId,
  });
  console.log(linkId, res);
  const isSpec = Boolean(res.data.root?.groupSpec?.length);
  const isDosing = Boolean(res.data.root?.tdProductDosingGroupInfos?.length);
  const isMenu = res.data.root?.menuType === "mealItems";
  const noData = !res.data.root || (!isSpec && !isDosing);
  if (noData || isMenu) {
    message.error("该商品不支持自定义添加");
    return;
  }
  const enabled_options = res.data.enabled_options || {};
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
  return optionsList;
};
