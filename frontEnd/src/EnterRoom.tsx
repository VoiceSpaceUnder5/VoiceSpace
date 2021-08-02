import { useState, useRef } from "react";
import 'antd/dist/antd.css';
import { message, Button } from 'antd';


function EnterRoom() {

    const info = () => {
        message.info('유효하지 않은 코드입니다');
    }
    const element = <><br /><Button id='button' onClick={info}>참가하기</Button></>;
    // const element = <button>참가하기</button>

    const [ focus, setFocus ] = useState(0);

    const onFocus = (e: any) => {
        setFocus(1);
    }

    const onBlur = (e: any) => {
        if (e.target.value === '')
            setFocus(0);
    }

    return (
        <div>
            <input onFocus={onFocus} onBlur={onBlur} placeholder="코드 또는 링크 입력" />
            { focus ? element : null}
        </div>
    );
}

export default EnterRoom;