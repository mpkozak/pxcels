import React, {
  memo,
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { cl } from '../../libs';





export default memo(function UserForm({
  uiMode = 0,
  active = false,
  username = '',
  post = null,
  hideForm = null,
} = {}) {


  const [name, setName] = useState(username !== 'anonymous' ? username : '');


  const inputRef = useRef(null);


  const handleReset = useCallback(e => {
    setName('');
  }, [setName]);


  const handleChange = useCallback(e => {
    const { value } = e.target;
    setName(value);
  }, [setName]);


  const handleSubmit = useCallback(e => {
    e.preventDefault();
    post(name || 'anonymous');
  }, [post, name]);


  const handleClick = useCallback(e => {
    e.stopPropagation();
  }, []);


  const wrapCl = useMemo(() => {
    return cl(
      'User__form-wrap',
      [uiMode === 1, 'User__form-wrap--touch'],
    );
  }, [uiMode]);


  const formCl = useMemo(() => {
    return cl(
      'User__form',
      [uiMode === 1, 'User__form--touch'],
      [!active, 'User__form--hide'],
    );
  }, [uiMode, active]);


  useEffect(() => {   // to hide keyboard after submit on iOS
    const el = inputRef.current;
    if (el && !active) {
      el.blur();
    };
  }, [active, inputRef]);


  return (
    <div className={wrapCl} onClick={hideForm}>
      <form className={formCl} onClick={handleClick} onSubmit={handleSubmit}>
        <input
          className="User__form-input"
          ref={inputRef}
          type="text"
          value={name}
          size={20}
          maxLength={32}
          placeholder="Enter your name..."
          onClick={handleReset}
          onChange={handleChange}
        />
        <button className="User__form-button">Sign your work!</button>
      </form>
    </div>
  );
});
