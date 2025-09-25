export const columns = [
  {
    title: "商品图片",
    dataIndex: "img",
    width: 100,
    slots: { customRender: "image" },
  },
  {
    title: "商品名称",
    dataIndex: "name",
    minWidth: 200,
    ellipsis: true,
  },
  {
    title: "商品id",
    dataIndex: "linkId",
    // minWidth: 100,
    ellipsis: true,
  },
  {
    title: "商品价格",
    dataIndex: "startPrice",
    width: 110,
    slots: { customRender: "startPrice" },
  },
  {
    title: "自定义价格",
    dataIndex: "price",
    width: 120,
    slots: { customRender: "price" },
  },
  {
    title: "状态",
    dataIndex: "status",
    width: 80,
    slots: { customRender: "status" },
  },
  // {
  //   title: "创建时间",
  //   dataIndex: "createTime",
  //   width: 180,
  //   slots: { customRender: "createTime" },
  // },
  // {
  //   title: "更新时间",
  //   dataIndex: "updateTime",
  //   width: 180,
  //   slots: { customRender: "updateTime" },
  // },
  {
    title: "操作",
    dataIndex: "action",
    width: 220,
    slots: { customRender: "action" },
  },
];
