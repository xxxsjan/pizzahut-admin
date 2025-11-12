import { getProductDetail } from "@/api";
import { cleanGroupName } from "./index.js";

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
  const dataRoot = res.data.root || {};
  const isSpec = Boolean(dataRoot?.groupSpec?.length);
  const isDosing = Boolean(dataRoot?.tdProductDosingGroupInfos?.length);
  const isMenu = dataRoot?.menuType === "mealItems";
  const noData = !dataRoot || (!isSpec && !isDosing);
  if (noData || isMenu) {
    return {
      success: false,
      msg: "该商品不支持自定义添加",
    };
  }
  const enabled_options = res.data.enabled_options || {};
  let optionsList = [];
  // 还原
  if (isSpec) {
    console.log("groupSpec: ", dataRoot.groupSpec);
    optionsList = buildSpecOptions(
      dataRoot.groupSpec,
      enabled_options,
      res.data.menus
    );
    console.log("optionsList: ", optionsList);
  } else if (isDosing) {
    optionsList = buildDosingOptions(
      dataRoot.tdProductDosingGroupInfos,
      enabled_options
    );
  }
  return {
    success: true,
    optionsList,
  };
};

export const getConfigByList = (list) => {
  return list.reduce((pre, cur) => {
    const groupName = (cur.groupName || "").replace(/\d+/g, "");
    pre[groupName] = (cur.value || []).reduce((p, c) => {
      const _data = cur.options.find((o) => o.label === c);
      p[c] = { price: _data?.price || 0 };
      return p;
    }, {});
    return pre;
  }, {});
};
export const objRemoveEmpty = (configs) => {
  const configMap = JSON.parse(JSON.stringify(configs));
  // 移除空对象
  Object.keys(configMap).forEach((groupName) => {
    if (Object.keys(configMap[groupName]).length === 0) {
      delete configMap[groupName];
    }
  });
  return configMap;
};
