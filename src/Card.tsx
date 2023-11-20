import {StarIcon} from './Icons';

export default function Card(props: {
    asCheckbox: boolean;
    isMiddleCard: boolean;
    textValue: string;
    onTextChange: (next: string) => void;
    checked: boolean;
    onCheckboxChange: () => void;
}) {
    const commonStyle: React.CSSProperties = {
        display: 'grid',
        placeItems: 'center',
        height: '9rem',
        width: '9rem',
        padding: '.25rem'
    };
    if (props.isMiddleCard)
        return (
            <div style={commonStyle}>
                <StarIcon />
            </div>
        );
    return (
        <div style={{...commonStyle}}>
            {props.asCheckbox ? (
                <div onClick={props.onCheckboxChange} style={{height: '100%', width: '100%'}}>
                    <input
                        type="checkbox"
                        style={{display: 'none'}}
                        checked={props.checked}
                        onChange={() => {}}
                    />
                    <label
                        style={{
                            ...commonStyle,
                            cursor: 'pointer',
                            height: '100%',
                            maxHeight: '8.5rem',
                            overflowY: 'auto',
                            width: '100%',
                            userSelect: 'none',
                            wordBreak: 'break-word',
                            padding: '.5rem .75rem',
                            lineHeight: '1.15'
                        }}
                    >
                        {props.textValue}
                    </label>
                </div>
            ) : (
                <textarea
                    style={{
                        width: '100%',
                        height: '100%',
                        resize: 'none',
                        padding: '.5rem'
                    }}
                    value={props.textValue}
                    onChange={(e) => props.onTextChange(e.target.value)}
                ></textarea>
            )}
        </div>
    );
}
