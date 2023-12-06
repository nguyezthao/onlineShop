import React from 'react';
import { Table } from 'antd';
import axiosClient from '../configs/axiosClient';


type Props = {};

export default function TableExamples({ }: Props) {
  const [categories, setCategories] = React.useState([]);
  React.useEffect(() => {
    const getCategories = async () => {
      const response = await axiosClient.get('/online-shop/categories');
      setCategories(response.data);

      console.log('response.data', response.data);
    };

    getCategories();
  }, []);

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },

    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  return (
    <div>
      <Table rowKey='id' dataSource={categories} columns={columns} />
    </div>
  );
}