import React, { memo, useState, useCallback } from 'react';
import './User.css';





export default memo(function User({ username = '', post = null } = {}) {
  const [name, setName] = useState(username);

  const handleReset = useCallback(e => {
    post('anonymous');
  }, [post]);


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
    <div className="Username toolbox">
      <div className="toolbox--inner">
        {!!username
          ? <h1 onClick={handleReset}>Hi {username}!</h1>
          : (
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={name}
                  // defaultValue="Enter your name"
                  placeholder="Your name"
                  onChange={handleChange}
                />
                <button>Sign your work!</button>
              </form>
            )
        }
      </div>
    </div>
  );
});
