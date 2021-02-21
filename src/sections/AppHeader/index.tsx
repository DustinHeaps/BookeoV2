import React, { useState, useEffect } from 'react';
import { Link, withRouter, RouteComponentProps, useLocation, useHistory } from 'react-router-dom';
import { Layout, Input } from 'antd';

import logo from './assets/logo-2.png';
import { MenuItems } from './components';
import { Viewer } from '../../lib/types';
import { displayErrorMessage } from '../../lib/utils';

const { Header } = Layout;
const { Search } = Input;

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

export const AppHeader = ({ viewer, setViewer }: Props) => {
  const [search, setSearch] = useState('');

  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const { pathname } = location;
    const pathnameSubStrings = pathname.split("/");

    if (!pathname.includes('/listings')) {
      setSearch('');
      return;
    }
    if (pathname.includes("/listings") && pathnameSubStrings.length === 3) {
      setSearch(pathnameSubStrings[2]);
      return;
    }
  }, [location]);

  const onSearch = (value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue) {
      history.push(`/listings/${trimmedValue}`);
    } else {
      displayErrorMessage('Please enter a valid search value!');
    }
  };
  return (
    <Header className='app-header'>
      <div className='app-header__logo-search-section'>
        <div className='app-header__logo'>
          <Link to='/'>
            <img src={logo} alt='App logo' />
          </Link>
        </div>
        <div className='app-header__search-input'>
          <Search
            placeholder="Search 'San Fransisco'"
            enterButton
            value={search}
            onChange={evt => setSearch(evt.target.value)}
            onSearch={onSearch}
          />
        </div>
      </div>
      <div className='app-header__menu-section'>
        <MenuItems viewer={viewer} setViewer={setViewer} />
      </div>
    </Header>
  );
};
