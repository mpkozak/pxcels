import React, { memo, useState, useCallback } from 'react';
import './User.css';





export default memo(function User({ username = '', post = null } = {}) {
  const [name, setName] = useState(username);


  const handleSubmit = useCallback(e => {
    e.preventDefault();
    if (!!name) {
      post(name);
      setName('');
    };
  }, [post, name, setName]);


  const handleChange = useCallback(e => {
    const { value } = e.target;
    setName(value);
  }, [setName]);


  return (
    <div className="Username">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          // defaultValue="Enter your name"
          placeholder="Your name"
          onChange={handleChange}
        />
        <button onClick={e => e.preventDefault}>Sign your work!</button>
      </form>
      {!!username && <h1>Hi {username}!</h1>}
    </div>
  );
});
