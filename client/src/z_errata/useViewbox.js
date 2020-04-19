
function useViewbox({
  elRef,
  elWindowRef,
  viewboxRef,
} = {}) {

  // const [size, setSize] = useState(null);
  // const [pos, setPos] = useState(null);


  // const calcSize = useCallback((el, elWindow) => {
  //   const width = parse.pct(elWindow.clientWidth / el.clientHeight);
  //   const height = parse.pct(elWindow.clientHeight / el.clientHeight);
  //   if (!width || !height) return null;
  //   return { width, height };
  // }, []);


  // const resizeViewbox = useCallback(() => {
  //   const el = elRef.current;
  //   const elWindow = elWindowRef.current;
  //   if (!el || !elWindow) return null;

  //   const size = calcSize(el, elWindow);
  //   setSize(size);
  // }, [elRef, elWindowRef, calcSize, setSize]);


  // const calcPos = useCallback((el, elWindow) => {
  //   const left = parse.pct((elWindow.scrollLeft - el.offsetLeft) / el.clientWidth);
  //   const top = parse.pct((elWindow.scrollTop - el.offsetTop) / el.clientHeight);
  //   if (!left || !top) return null;
  //   return { left, top };
  // }, []);


  // const repositionViewbox = useCallback(() => {
  //   const el = elRef.current;
  //   const elWindow = elWindowRef.current;
  //   if (!el || !elWindow) return null;

  //   const pos = calcPos(el, elWindow);
  //   setPos(pos);
  // }, [elRef, elWindowRef, calcPos, setPos]);



  // // useEffect(() => {   // resize
  // //   window.addEventListener('resize', resizeViewbox, { passive: true });

  // //   return () => window.removeEventListener('resize', resizeViewbox);
  // // }, [resizeViewbox]);



  // useEffect(() => {   // reposition
  //   const el = elWindowRef.current;
  //   if (el) {
  //     el.addEventListener('scroll', repositionViewbox, { passive: true });
  //     window.addEventListener('resize', resizeViewbox, { passive: true });
  //   };

  //   return () => {
  //     if (el) {
  //       el.removeEventListener('scroll', repositionViewbox);
  //       window.removeEventListener('resize', resizeViewbox);
  //     };
  //   };
  // }, [elWindowRef, repositionViewbox, resizeViewbox]);




  // useEffect(() => {   // initial
  //     console.log('initial effect')

  //   const el = elRef.current;
  //   const elWindow = elWindowRef.current;

  //   if (el && elWindow) {
  //     console.log('initial effect --- RAN')
  //     if (!size) {
  //       console.log('initial effect --- RAN SIZE')
  //       resizeViewbox();
  //     };
  //     if (!pos) {
  //       console.log('initial effect --- RAN POSITION')
  //       repositionViewbox();
  //     };
  //   };
  // }, [elRef, elWindowRef, size, resizeViewbox, pos, repositionViewbox]);



  // useEffect(() => {   // initial
  //     console.log('redraw effect')
  //   const viewbox = viewboxRef.current;
  //   if (viewbox && size && pos) {
  //     const { style } = viewbox;
  //     style.left = pos.left;
  //     style.top = pos.top;
  //     style.width = size.width;
  //     style.height = size.height;
  //   };
  // }, [viewboxRef, size, pos]);







  const positionViewbox = useCallback(() => {
    const el = elRef.current;
    const elWindow = elWindowRef.current;
    const viewbox = viewboxRef.current;
    if (!elWindow || !el || !viewbox) {
      return null;
    };

    const viewboxWidth = elWindow.clientWidth / el.clientHeight;
    const viewboxHeight = elWindow.clientHeight / el.clientHeight;
    const viewboxLeft = (elWindow.scrollLeft - el.offsetLeft) / el.clientWidth;
    const viewboxTop = (elWindow.scrollTop - el.offsetTop) / el.clientHeight;

    const { style } = viewbox;
    style.left = parse.pct(viewboxLeft);
    style.top = parse.pct(viewboxTop);
    style.width = parse.pct(viewboxWidth);
    style.height = parse.pct(viewboxHeight);
  }, [elRef, elWindowRef, viewboxRef]);


  useEffect(() => {   // redraw viewbox on change
    const el = elWindowRef.current;
    if (el) {
      el.addEventListener('scroll', positionViewbox, { passive: true });
      window.addEventListener('resize', positionViewbox, { passive: true });
    };

    return () => {
      if (el) {
        el.removeEventListener('scroll', positionViewbox);
        window.removeEventListener('resize', positionViewbox);
      };
    };
  }, [elWindowRef, positionViewbox]);


  useEffect(() => {   // initial draw
    if (elRef.current && elWindowRef.current && viewboxRef.current) {
      positionViewbox();
    };
  }, [elRef, elWindowRef, viewboxRef, positionViewbox]);
};

