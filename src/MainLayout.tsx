import React from 'react';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;



const sideMenuItems = [

    {
        key: 'login',
        label: 'Trang chủ',
    },
    {
        key: 'categories',
        label: 'Categories',
    },
    {
        key: 'suppliers',
        label: 'Suppliers',
    },
    {
        key: 'products',
        label: 'Products',
    },
    {
        key: 'employees',
        label: 'Employees',
    },
    {
        key: 'customers',
        label: 'Customers',
    },
    {
        key: 'orders',
        label: 'Orders',
    },
];

type Props = {};

export default function MainLayout({ }: Props) {
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const navigate = useNavigate();
    const location = useLocation();

    console.log(location);

    return (
        <Layout>

            <Content style={{ padding: '0 50px' }}>

                <Layout style={{ padding: '24px 0', background: colorBgContainer }}>
                    <Sider style={{ background: colorBgContainer }} width={200}>
                        <Menu

                            mode='inline'
                            defaultSelectedKeys={[location.pathname.replace('/online-shop/', '')]}
                            defaultOpenKeys={['login']}
                            style={{ height: '100%', background: '#4f627e', color: '#ffffff' }}
                            items={sideMenuItems}
                            onSelect={(item) => {
                                console.log(item.key);
                                navigate('/online-shop/' + item.key);
                            }}
                        />
                    </Sider>
                    <Content style={{ padding: '0 0px', minHeight: 280 }}>
                        <Outlet />
                    </Content>
                </Layout>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Aptech ©2023 Created by N</Footer>
        </Layout>
    );
}