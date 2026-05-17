// client/src/components/JsonViewer.jsx
export default function JsonViewer({ layout }) {
  return (
    <pre style={{
      background: '#1e1e1e',
      color: '#d4d4d4',
      padding: '1rem',
      borderRadius: '8px',
      fontSize: '12px',
      overflow: 'auto',
      margin: 0,
      height: '100%'
    }}>
      {JSON.stringify(layout, null, 2)}
    </pre>
  );
}