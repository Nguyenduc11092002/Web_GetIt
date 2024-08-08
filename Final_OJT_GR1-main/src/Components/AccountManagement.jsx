import React from "react";
import { Table, Button } from "antd";
import axios from "axios";

const AccountManagement = () => {
  return (
    <main>
      <div>
        <h2>Account Info</h2>
        <p>This is the account info page.</p>
      </div>
      <section className="account">
        <div className="account-view"></div>
        <div className="account-create"></div>
        <div className="account-edit"></div>
        <div className="account-delete"></div>
      </section>

      <section className="reset"></section>
    </main>
  );
};

export default AccountManagement;