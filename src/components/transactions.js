import React from 'react';
import { Tabs } from 'antd';
import Depositreq from './funds/depositreq';
import Adddeposit from './funds/adddeposit';
import Withdrawreq from './funds/withdrawreq';
import Addwithdraw from './funds/addwithdrawl';
import Transhistory from './funds/transhistory';

const Transactions = ({ userId }) => {
    const items = [
        { key: '1', label: 'Deposit Requests', children: <div>Deposit Requests for User: <Depositreq userId={userId} /></div> },
        { key: '2', label: 'Add Deposit', children: <div>Add Deposit for User: <Adddeposit userId={userId} /> </div> },
        { key: '3', label: 'Withdraw Requests', children: <div>Withdraw Requests for User: <Withdrawreq userId={userId} /></div> },
        { key: '4', label: 'Add Withdraw', children: <div>Add Withdraw for User: <Addwithdraw userId={userId} /> </div> },
        { key: '5', label: 'Total Transactions', children: <div>Total Transactions for User: <Transhistory userId={userId} /></div> },
    ];

    return <Tabs defaultActiveKey="1" items={items} />;
};

export default Transactions;
