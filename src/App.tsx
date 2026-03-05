// Updated src/App.tsx to fix routing issues and role mismatches.
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import ComponentOne from './components/ComponentOne';
import ComponentTwo from './components/ComponentTwo';
// More imports...

const App = () => {
  return (
    <Switch>
      {/* Consolidated routes */}
      <Route path="/seo" component={ComponentOne} />
      <Route path="/franchise" component={ComponentTwo} />
      {/* Other routes... */}
      {/* Removed duplicate routes and unnecessary role checks */}
    </Switch>
  );
};

export default App;

// Other necessary updates such as role arrays and removing class
