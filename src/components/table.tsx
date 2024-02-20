import { ImageCompressProps } from '../App';
import CustomSpinner from './loading';

interface ITableProps {
    imageCompressProps: ImageCompressProps;
    downloadImage: () => void;

    resetState: () => void;
    onLoadImageInput: () => void;
    onLoadImageOutput: () => void;
}

export const Table = (props: ITableProps) => {
    const { imageCompressProps, downloadImage, resetState, onLoadImageInput, onLoadImageOutput } = props;
    return (
        <>
            {imageCompressProps.inputUrl && (
                <table>
                    <thead>
                        <tr>
                            <td align="center">
                                <div className="cell">
                                    <span>Input preview </span>
                                    <button onClick={resetState}>Reset</button>
                                </div>
                            </td>
                            <td align="center">
                                <div className="cell">
                                    <span>Output preview </span>
                                    {!!imageCompressProps.outputUrl && <button onClick={downloadImage}>Download</button>}
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td align="center">
                                {imageCompressProps.inputLoaded ? (
                                    <img src={imageCompressProps.inputUrl} alt="input" onLoad={onLoadImageInput} />
                                ) : (
                                    <CustomSpinner />
                                )}
                            </td>
                            <td align="center">
                                {imageCompressProps.outputLoaded ? (
                                    <img src={imageCompressProps.outputUrl} alt="output" onLoad={onLoadImageOutput} />
                                ) : (
                                    <CustomSpinner />
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            )}
        </>
    );
};
