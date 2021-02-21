import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import { ApolloProvider, useMutation } from '@apollo/react-hooks';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Home, Host, Listing, Listings, NotFound, User, AppHeader, Stripe } from './sections';
import { Layout, Affix, Spin } from 'antd';
import { Viewer } from './lib/types';
import { loadStripe } from '@stripe/stripe-js';

import { LOGIN } from './lib/graphql/mutations/LogIn';
import { LogIn as LogInData, LogInVariables } from './lib/graphql/mutations/LogIn/__generated__/LogIn';
import { AppHeaderSkeleton } from './sections/AppHeader/components/AppHeaderSkeleton';
import { ErrorBanner } from './lib/components';
import { Login } from './sections/Login';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_3B3ksIMI2sXXfLBK1gCijhgZ');

const initialViewer: Viewer = {
  id: null,
  token: null,
  avatar: null,
  hasWallet: null,
  didRequest: false
};

function App() {
  const [viewer, setViewer] = useState<Viewer>(initialViewer);
  const [logIn, { error }] = useMutation<LogInData, LogInVariables>(LOGIN, {
    onCompleted: data => {
      if (data && data.logIn) {
        setViewer(data.logIn);
      }

      if (data.logIn.token) {
        sessionStorage.setItem('token', data.logIn.token);
      } else {
        sessionStorage.removeItem('token');
      }
    }
  });

  const logInRef = useRef(logIn);

  useEffect(() => {
    logInRef.current();
  }, []);

  if (!viewer.didRequest && !error) {
    return (
      <Layout className='app-skeleton'>
        <AppHeaderSkeleton />
        <div className='app-skeleton__spin-section'>
          <Spin size='large' tip='Launching Bookeo' />
        </div>
      </Layout>
    );
  }

  const logInErrorBannerElement = error ? (
    <ErrorBanner description="We weren't able to verify if you were logged in. Please try again later!" />
  ) : null;

  return (
    <Router>
      <Layout id='app'>
        <Affix offsetTop={0} className='app__affix-header'>
          <AppHeader viewer={viewer} setViewer={setViewer} />
        </Affix>
        {logInErrorBannerElement}
        <Switch>
          <Route exact path='/'>
            <Home />
          </Route>
          <Route exact path='/host'>
            <Host viewer={viewer} />
          </Route>
          <Route exact path='/listing/:id'>
            <Elements stripe={stripePromise}>
              <Listing viewer={viewer} />
            </Elements>
          </Route>

          <Route exact path='/listings/:location?'>
            <Listings />
          </Route>
          <Route exact path='/login'>
            <Login setViewer={setViewer} />
          </Route>
          <Route exact path='/user/:id'>
            <User viewer={viewer} setViewer={setViewer} />
          </Route>
          <Route exact path='/stripe'>
            <Stripe viewer={viewer} setViewer={setViewer} />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </Router>
  );
}

export default App;
