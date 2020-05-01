import React, { memo, useState, useCallback } from 'react';
import './User.css';
import { useGlobalContext } from '../../hooks';
import { UserButton, UserForm } from './';





export default memo(function User({
  username = '',
  postMessage = null
} = {}) {

  const [context] = useGlobalContext();
  const { uiMode } = context;


  const [active, setActive] = useState(false);


  const toggleForm = useCallback(() => {
    setActive(!active);
  }, [active, setActive]);


  const hideForm = useCallback(e => {
    e.stopPropagation();
    setActive(false);
  }, [setActive]);


  const post = useCallback(name => {
    if (!name) return null;
    setActive(false);
    postMessage('set_name', name);
  }, [setActive, postMessage]);


  return (
    <div className="User">
      <UserButton uiMode={uiMode} toggleForm={toggleForm} />
      <UserForm
        uiMode={uiMode}
        active={active}
        username={username}
        post={post}
        hideForm={hideForm}
      />
    </div>
  );
});
