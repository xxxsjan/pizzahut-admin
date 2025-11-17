<template>
  <div>
    <div>
      <a-form
        layout="inline"
        @submit.prevent="handleSubmit"
        style="margin-bottom: 13px"
      >
        <a-form-item label="套餐名">
          <a-input
            v-model:value="formState.keyword"
            placeholder="请输入套餐名"
          />
        </a-form-item>

        <a-space>
          <a-button type="primary" @click="handleSearch">搜索</a-button>
          <a-button @click="reset">重置</a-button>
          <a-button @click="handleAddPackage">新增</a-button>
        </a-space>
      </a-form>
    </div>
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :dataSource="dataSource"
        :rowKey="(record) => record.productCode"
        bordered
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        size="middle"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'operation'">
            <div class="flex">
              <a-button type="link" @click="handleViewDetail(record)"
                >查看
              </a-button>
              <a-button type="link" @click="handleEdit(record)">编辑</a-button>
              <a-button type="link" danger @click="handleDelete(record)"
                >删除</a-button
              >
              <a-button type="link" @click="handleAddOrder(record)"
                >新建卡密订单</a-button
              >
            </div>
          </template>
        </template></a-table
      >
    </a-card>

    <ModalEdit
      v-model="editOpen"
      @confirm="handleSearch"
      :current-package="currentPackage"
      :type="modalType"
    />
    <ModalDetail
      v-if="detailOpen"
      v-model:open="detailOpen"
      :current-package="currentPackage"
    />
    <ModalAddOrder
      v-if="showAddOrderModal"
      v-model:open="showAddOrderModal"
      :record="curRecord"
      @ok="() => (showAddOrderModal = false)"
    />
  </div>
</template>

<script setup>
import { getPackageList, deletePackage, addCardOrder } from "@/api";
import { message, Modal } from "ant-design-vue";
import { SearchOutlined } from "@ant-design/icons-vue";
import ModalEdit from "./ModalEdit.vue";
import ModalDetail from "./ModalDetail.vue";
import ModalAddOrder from "./ModalAddOrder.vue";

import { usePackageEditStore } from "@/stores/packageEdit";

const packageEditStore = usePackageEditStore();

const editOpen = ref(false);
const modalType = ref("view");

const detailOpen = ref(false);
const showAddOrderModal = ref(false);

const curRecord = ref({});
const currentPackage = ref({
  packageName: "",
  packageDetail: {
    group: [],
  },
  price: "",
  currentPackage: {},
});
function setCurrentPackage(data) {
  const dataCopy = JSON.parse(JSON.stringify(data));
  dataCopy.packageDetail.group.forEach((item) => {
    item.productList.forEach((product) => {
      product.status = product.status || 0;
    });
  });
  console.log("dataCopy: ", dataCopy);
  currentPackage.value.packageDetail = dataCopy.packageDetail;
  currentPackage.value.packageName = dataCopy.packageName;
  currentPackage.value.id = dataCopy.id;
  currentPackage.value.price = dataCopy.price;

  packageEditStore.setGoodsConfigs(dataCopy.goodsConfigs || {});
}
// 新增查看详情方法
const handleViewDetail = (record) => {
  console.log("record: ", record);
  currentPackage.value = record; // 保存当前套餐数据
  detailOpen.value = true; // 打开详情弹窗
};

const loading = ref(false);

const dataSource = ref([]);
const formState = ref({ keyword: "" });

// 新增分页状态
const pagination = ref({
  current: 1, // 当前页
  pageSize: 10, // 每页数量
  total: 0, // 总数据量
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ["10", "20", "50", "100"],
});

const columns = [
  {
    title: "套餐名称",
    dataIndex: "packageName",
    key: "packageName",
    width: 150,
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    key: "createTime",
    width: 150,
    customRender: ({ record }) => {
      const date = new Date(record.createTime);
      const pad = (num) => num.toString().padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
      )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
        date.getSeconds()
      )}`;
    },
  },
  {
    title: "价格",
    dataIndex: "price",
    key: "price",
    width: 50,
  },
  {
    title: "操作",
    dataIndex: "operation",
    width: 50,
  },
];

const handleSubmit = (values) => {
  console.log("values: ", values);
};

const handleEdit = (record) => {
  console.log("record: ", record);
  modalType.value = "edit";
  setCurrentPackage(record);
  editOpen.value = true;
};
const handleSearch = async () => {
  console.log("formState: ", formState.value);
  console.log("pagination: ", pagination);
  loading.value = true;
  try {
    const res = await getPackageList({
      // packageId: "",
      keyword: formState.value.keyword,
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
    });
    dataSource.value = res.data.map((m) => {
      const packageDetail = JSON.parse(m.packageDetail || "{}");
      console.log('packageDetail: ', packageDetail);
      packageDetail.group.forEach(item=>{
        item.productList.forEach(product=>{
          product.price = product.price || 0;
        })
      })
      console.log("packageDetail: ", packageDetail);

      return {
        ...m,
        packageDetail,
      };
    });
    console.log("dataSource: ", dataSource);
    pagination.value.total = res.count;
  } catch (err) {
    message.error("搜索失败，请稍后重试");
    console.error("搜索接口异常：", err);
  } finally {
    loading.value = false;
  }
};

// 重置分页和表单
const reset = () => {
  formState.value.keyword = "";
  pagination.value.current = 1;
  handleSearch();
};

const handleAddPackage = () => {
  modalType.value = "add";
  setCurrentPackage({
    packageName: "",
    packageDetail: { group: [] },
  });
  editOpen.value = true;
};

const handleTableChange = (paginationInfo) => {
  pagination.value.current = paginationInfo.current;
  pagination.value.pageSize = paginationInfo.pageSize;
  handleSearch();
};
const handleDelete = async (record) => {
  console.log("record: ", record);
  Modal.confirm({
    title: "确认删除",
    content: "是否确认删除该套餐？删除后无法恢复",
    okText: "确认",
    okType: "danger",
    cancelText: "取消",
    onOk: async () => {
      try {
        await deletePackage({ id: record.id });
        message.success("删除成功");
        handleSearch();
      } catch (err) {
        message.error("删除失败");
      }
    },
    onCancel: () => {
      message.info("已取消删除");
    },
  });
};
const handleAddOrder = (record) => {
  console.log("record: ", record);
  curRecord.value = record;
  showAddOrderModal.value = true;
};

onMounted(() => {
  handleSearch();
});
</script>

<style scoped></style>
