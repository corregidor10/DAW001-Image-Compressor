import './App.css';
import React, { useCallback, useState } from 'react';
import imageCompression from 'browser-image-compression';
import CustomSpinner from './components/loading';

type ImageCompressProps = {
    progress?: number;
    inputSize?: string;
    outputSize?: string;
    inputUrl?: string;
    outputUrl?: string;
    fileName?: string;
    inputLoaded: boolean;
    outputLoaded: boolean;
};

type CompressOptions = {
    maxSizeMB: number;
    maxWidthOrHeight: number;
};

const initialState: ImageCompressProps = {
    inputLoaded: false,
    outputLoaded: false,
};
const initialOptions: CompressOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 528,
};

const App = () => {
    const [compressOptions, setCompressOptions] = useState<CompressOptions>(initialOptions);

    const [state, setState] = useState<ImageCompressProps>(initialState);

    const onProgress = useCallback((p: number) => {
        setState((prevState) => ({ ...prevState, progress: p }));
    }, []);

    const downloadImage = useCallback(() => {
        const link = document.createElement('a');
        link.href = state.outputUrl!;
        link.download = state.fileName ? state.fileName.replace('.', '-compressed.') : 'output.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [state.outputUrl, state.fileName]);

    const resetState = useCallback(() => {
        if (state.inputUrl) URL.revokeObjectURL(state.inputUrl);
        if (state.outputUrl) URL.revokeObjectURL(state.outputUrl);

        setState(initialState);
    }, [state.inputUrl, state.outputUrl]);

    const compressImage = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            event.preventDefault();
            if (event.target.files === null) {
                return;
            }
            const file = event.target.files![0];
            const options = {
                ...compressOptions,
                onProgress,
            };

            setState((prevState) => ({
                ...prevState,
                inputSize: (file.size / 1024 / 1024).toFixed(2),
                inputUrl: URL.createObjectURL(file),
            }));

            const output = await imageCompression(file, options);

            setState((prevState) => ({
                ...prevState,
                outputSize: (output.size / 1024 / 1024).toFixed(2),
                outputUrl: URL.createObjectURL(output),
                fileName: file.name,
                inputLoaded: true,
                outputLoaded: true,
            }));
        },
        [compressOptions, onProgress],
    );

    const onCompressOptionsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const { name, value } = event.currentTarget;
        setCompressOptions((prevState) => ({ ...prevState, [name]: value }));
    };

    const onLoadImageInput = () => {
        setState((prevState) => ({ ...prevState, inputLoaded: true }));
    };
    const onLoadImageOutput = () => {
        setState((prevState) => ({ ...prevState, outputLoaded: true }));
    };

    return (
        <div className="app">
            <h2>Browser Image Compression</h2>
            <div className="app_container">
                <div className="app_options">
                    <h4>Options</h4>
                    <label htmlFor="maxSizeMB">
                        maxSizeMB:
                        <input type="number" name="maxSizeMB" value={compressOptions.maxSizeMB} onChange={onCompressOptionsChange} />
                    </label>
                    <br />
                    <br />
                    <label htmlFor="maxWidthOrHeight">
                        maxWidthOrHeight:
                        <input type="number" name="maxWidthOrHeight" value={compressOptions.maxWidthOrHeight} onChange={onCompressOptionsChange} />
                    </label>
                    <br />
                    <hr />
                    <label htmlFor="main-thread">
                        <span>Compress in main-thread {state.progress && <span>{state.progress} %</span>}</span>
                        <input id="main-thread" type="file" accept="image/*" onChange={compressImage} />
                    </label>
                    <p>
                        {state.inputSize && (
                            <span>
                                Source image size: <strong>{state.inputSize} MB</strong>
                            </span>
                        )}
                        {state.outputSize && (
                            <span>
                                Output image size: <strong>{state.outputSize} MB</strong>
                            </span>
                        )}
                    </p>
                </div>
                {state.inputUrl && (
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
                                        {!!state.outputUrl && <button onClick={downloadImage}>Download</button>}
                                    </div>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td align="center">
                                    {state.inputLoaded ? <img src={state.inputUrl} alt="input" onLoad={onLoadImageInput} /> : <CustomSpinner />}
                                </td>
                                <td align="center">
                                    {state.outputLoaded ? <img src={state.outputUrl} alt="output" onLoad={onLoadImageOutput} /> : <CustomSpinner />}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default App;
