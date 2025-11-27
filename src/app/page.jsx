cat > src/app/page.jsx << 'EOF'
import DataPresentationTool from '../components/DataPresentationTool';

export default function Home() {
  return <DataPresentationTool />;
}
EOF