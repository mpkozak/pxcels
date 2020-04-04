import React, { memo, useState, useCallback } from 'react';
import './User.css';





export default memo(function User({ username = '', handleName = null } = {}) {
  const [name, setName] = useState(username);


  const handleSubmit = useCallback(e => {
    e.preventDefault();
    handleName(name);
    setName('');
  }, [handleName, name, setName]);


  const handleChange = useCallback(e => {
    const { value } = e.target;
    setName(value);
  }, [setName]);


  return (
    <div id="User" className={!username ? 'showform' : ''}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          // defaultValue="Enter your name"
          placeholder="Enter name"
          onChange={handleChange}
        />
        <button>Submit</button>
      </form>
      {username && <h1>Hi {username}!</h1>}
    </div>
  );
});
