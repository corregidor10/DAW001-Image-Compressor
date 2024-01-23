import './App.css';
import React, { useCallback, useState } from 'react';
import imageCompression from 'browser-image-compression';

type State = {
    progress?: number;
    inputSize?: string;
    outputSize?: string;
    inputUrl?: string;
    outputUrl?: string;
    fileName?: string;
};

const initialState: State = {};

const App = () => {
    const [maxSizeMB, setMaxSizeMB] = useState(1);
    const [maxWidthOrHeight, setMaxWidthOrHeight] = useState(1024);
    const [state, setState] = useState<State>(initialState);

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
                maxSizeMB,
                maxWidthOrHeight,
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
            }));
        },
        [maxSizeMB, maxWidthOrHeight, onProgress],
    );

    return (
        <div className="app">
            <h2>Browser Image Compression</h2>
            <div className="app_container">
                <div className="app_options">
                    Options:
                    <br />
                    <label htmlFor="maxSizeMB">
                        maxSizeMB:
                        <input
                            type="number"
                            id="maxSizeMB"
                            name="maxSizeMB"
                            value={maxSizeMB}
                            onChange={(e) => setMaxSizeMB(Number(e.currentTarget.value))}
                        />
                    </label>
                    <br />
                    <label htmlFor="maxWidthOrHeight">
                        maxWidthOrHeight:
                        <input
                            type="number"
                            id="maxWidthOrHeight"
                            name="maxWidthOrHeight"
                            value={maxWidthOrHeight}
                            onChange={(e) => setMaxWidthOrHeight(Number(e.currentTarget.value))}
                        />
                    </label>
                    <hr />
                    <label htmlFor="main-thread">
                        Compress in main-thread {state.progress && <span>{state.progress} %</span>}
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
                                <td>
                                    <div className="cell">
                                        input preview <button onClick={resetState}>Reset</button>
                                    </div>
                                </td>
                                <td>
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
                                    <img src={state.inputUrl} alt="input" />
                                </td>
                                <td align="center">
                                    <img src={state.outputUrl} alt="output" />
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
