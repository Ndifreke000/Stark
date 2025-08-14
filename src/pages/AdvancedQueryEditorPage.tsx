import React from 'react';
import AdvancedQueryEditor from '../components/QueryEditor/AdvancedQueryEditor';

const AdvancedQueryEditorPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)]">{/* account for navbar height */}
      <AdvancedQueryEditor />
    </div>
  );
};

export default AdvancedQueryEditorPage;
