const fs = require("fs");
const p = "e:/Element-P2P/New-Screen-Design/Element-P2P/src/app/pages/MainPurchaseRequestV2.tsx";
let text = fs.readFileSync(p, "utf8");
const startMarker = "            <motion.div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0', gap: '16px', flexWrap: 'wrap' }}>";
const startMarker2 = "            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0', gap: '16px', flexWrap: 'wrap' }}>";
const endMarker = "            {/* PR Details */}";
let start = text.indexOf(startMarker2);
if (start === -1) start = text.indexOf(startMarker);
const end = text.indexOf(endMarker, start);
if (start === -1 || end === -1) { console.error("not found", start, end); process.exit(1); }
const replacement = `            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#101828', fontFamily: F }}>Purchase Request</h1>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#667085', fontFamily: F, lineHeight: 1.4 }}>
                {prId}
                <span style={{ color: '#D0D5DD' }} aria-hidden> · </span>
                {headerFieldData.department}
                <span style={{ color: '#D0D5DD' }} aria-hidden> · </span>
                Needed by {headerFieldData.requiredBy}
              </p>
            </div>

            <WorkflowActionBar
              status={status}
              viewRole={viewRole}
              onViewRoleChange={setViewRole}
              poCreated={poCreated}
              nextAction={viewRole === 'approver' ? APPROVER_NEXT_ACTION : nextAction}
              handlers={{
                onSave: handleSave,
                onSubmit: handleSubmit,
                onCancel: handleCancel,
                onRecall: handleRecall,
                onCopy: handleCopy,
                onApprove: handleApprove,
                onReject: handleReject,
                onRequireChange: handleRequireChanges,
                onCreatePO: handleCreatePO,
                onEmailPO: handleEmailPO,
                onCreateChangeOrder: handleCreateChangeOrder,
              }}
            />

`;
fs.writeFileSync(p, text.slice(0, start) + replacement + text.slice(end));
console.log("patched");
