import { useState } from 'react';
import {
  Box,
  FileCode2,
  Code2,
  Copy,
  Terminal,
  Folder,
  Download,
  ArrowLeft,
  Check,
  Braces,
} from 'lucide-react';
import { generateFiles } from '../../packages/codegen/browser.js';
import { REACTIONS } from '../../packages/core/config.js';
import { Tabs, Segmented } from '../ui/Controls.jsx';
import { downloadSources, downloadConfig } from './download.js';
function CodeBlock({ label, code, onCopy }) {
  return (
    <div className="code-example">
      <div>
        <strong>{label}</strong>
        <button
          aria-label={`Copy ${label}`}
          onClick={() => onCopy(code, label)}
        >
          <Copy size={13} />
          Copy
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
export function ExportPanel({ config, patch, notify, tab, setTab }) {
  const [fileView, setFileView] = useState('');
  const [copied, setCopied] = useState('');
  const files = generateFiles(config);
  const command = `node packages/cli/bin/wobbi.js add ${config.preset}${config.export.framework === 'next' ? ' --framework next' : ''}`;
  async function copy(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      notify(`${label} copied`);
    } catch {
      notify('Clipboard unavailable. Select and copy the code manually.');
    }
  }
  const name = config.componentName;
  const importPath = config.export.folder
    .replace(/^src\//, '@/')
    .replace(/\\/g, '/');
  const snippets = [
    ['Import', `import { ${name} } from "${importPath}"`],
    ['Default', `<${name} />`],
    ['Change reaction', `<${name} state="thinking" />`],
    ['Dynamic state', `<${name} state={isLoading ? "loading" : "happy"} />`],
  ];
  return (
    <aside className="export-panel" id="export-panel" aria-label="Export panel">
      <Tabs
        label="Export"
        value={tab}
        onChange={setTab}
        panelId="export-content"
        items={[
          { value: 'install', label: 'Install', icon: Box },
          { value: 'files', label: 'Generated Files', icon: FileCode2 },
          { value: 'usage', label: 'Usage', icon: Code2 },
        ]}
      />
      <div
        role="tabpanel"
        id="export-content"
        aria-label={
          tab === 'files'
            ? 'Generated Files'
            : tab === 'usage'
              ? 'Usage'
              : 'Install'
        }
        className="export-content"
      >
        {tab === 'install' && (
          <>
            <div className="export-heading">
              <h2>Add to your project</h2>
              <p>
                A little personality. A few files.
                <br />
                Your mascot is ready to move in.
              </p>
            </div>
            <Segmented
              label="Export framework"
              value={config.export.framework}
              onChange={(framework) =>
                patch({ export: { ...config.export, framework } })
              }
              options={[
                {
                  value: 'react',
                  label: (
                    <>
                      <span className="react-symbol">⚛</span> React
                    </>
                  ),
                },
                {
                  value: 'next',
                  label: (
                    <>
                      <span className="next-symbol">N</span> Next.js
                    </>
                  ),
                },
              ]}
            />
            <div className="install-command">
              <Terminal size={17} />
              <code>{command}</code>
              <button
                aria-label="Copy install command"
                onClick={() => copy(command, 'Command')}
              >
                <Copy size={15} />
              </button>
            </div>
            <div className="local-registry-note">
              <strong>
                <span className="purple-dot" />
                Local registry · V1
              </strong>
              <p>
                Run from the Wobbi workspace. Installs the original{' '}
                {config.preset} preset. To use your edits, download the sources
                below.
              </p>
              <details>
                <summary>Future npm command</summary>
                <code>npx wobbi@latest add {config.preset}</code>
                <p>
                  Target syntax only. This workspace package is not published to
                  npm.
                </p>
              </details>
            </div>
            <div className="ownership">
              <Box size={23} />
              <div>
                <strong>Your code, yours.</strong>
                <p>
                  Files are copied into your project and remain fully editable.
                  No subscription. No strings attached.
                </p>
              </div>
            </div>
            <button
              className="primary full"
              onClick={() => copy(command, 'Command')}
            >
              {copied === 'Command' ? <Check size={16} /> : <Copy size={16} />}
              Copy command
            </button>
            <button
              className="download-button"
              onClick={() => {
                downloadSources(config);
                notify('Sources downloaded');
              }}
            >
              <Download size={16} />
              Download your mascot .zip
            </button>
            <div className="export-bottom">
              <span>4 source files</span>
              <span>React · JavaScript</span>
            </div>
          </>
        )}
        {tab === 'files' && (
          <>
            <div className="export-heading">
              <h2>Generated files</h2>
              <p>
                Everything your mascot needs.
                <br />
                Nothing you can’t change.
              </p>
            </div>
            <div className="file-tree">
              <div>
                <Folder size={19} />
                <code>{config.export.folder}/</code>
              </div>
              {Object.keys(files).map((file, index) => (
                <button
                  key={file}
                  aria-label={`View ${file}`}
                  onClick={() => setFileView(fileView === file ? '' : file)}
                  aria-expanded={fileView === file}
                >
                  <span className="tree-branch">{index === 3 ? '└' : '├'}</span>
                  <FileCode2
                    size={17}
                    className={file.endsWith('jsx') ? 'cyan' : 'accent'}
                  />
                  {file}
                </button>
              ))}
            </div>
            {fileView && files[fileView] && (
              <div className="source-view">
                <div>
                  <strong>{fileView}</strong>
                  <button
                    aria-label="Copy file source"
                    onClick={() => copy(files[fileView], fileView)}
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <pre data-testid="source-code">
                  <code>{files[fileView]}</code>
                </pre>
              </div>
            )}
            <div className="ownership">
              <Box size={23} />
              <div>
                <strong>Fully editable source</strong>
                <p>
                  No opaque runtime. Change every animation, style, or behavior
                  after installation.
                </p>
              </div>
            </div>
            <button
              className="primary full"
              onClick={() => {
                downloadSources(config);
                notify('Sources downloaded');
              }}
            >
              <Download size={16} />
              Download source files
            </button>
            <button
              className="download-button"
              onClick={() => copy(Object.keys(files).join('\n'), 'File list')}
            >
              <Copy size={15} />
              Copy file list
            </button>
            <button
              className="download-button"
              onClick={() => {
                downloadConfig(config);
                notify('Configuration downloaded');
              }}
            >
              <Braces size={15} />
              Download configuration
            </button>
            <button className="text-button" onClick={() => setTab('install')}>
              <ArrowLeft size={14} />
              Back to Install
            </button>
          </>
        )}
        {tab === 'usage' && (
          <>
            <div className="export-heading">
              <h2>Use your mascot</h2>
              <p>Import {name} and give it a little direction.</p>
            </div>
            {snippets.map(([label, code]) => (
              <CodeBlock key={label} label={label} code={code} onCopy={copy} />
            ))}
            <div className="available-states">
              <h3>Available states</h3>
              <div>
                {REACTIONS.map((state) => (
                  <code key={state}>{state}</code>
                ))}
              </div>
            </div>
            <p className="usage-note">
              Use <code>size</code> to scale it, <code>playing</code> to pause
              it, and <code>aria-label</code> to give it a voice.
            </p>
          </>
        )}
      </div>
      <div className="export-signoff">
        <Box size={14} /> Small footprint. Big personality.
      </div>
    </aside>
  );
}
