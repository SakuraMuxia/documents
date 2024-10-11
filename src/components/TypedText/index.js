import React, { useEffect, useRef } from 'react';
import Typed from 'typed.js';
import styles from './styles.module.css'
const TypedText = () => {
    // 使用 ref 以便引用元素
    const el = useRef(null);

    useEffect(() => {
        // 创建 Typed.js 的实例
        const typed = new Typed(el.current, {
            strings: ['Welcome to you!', 'Enjoy your stay!'], // 要显示的文本
            typeSpeed: 50,
            backSpeed: 25,
            showCursor: false,
            loop: true, // 设置是否循环
        });

        // 在组件卸载时销毁 Typed.js 实例
        return () => {
            typed.destroy();
        };
    }, []);

    return <span className={styles.typedElement} ref={el}></span>;
};

export default TypedText;