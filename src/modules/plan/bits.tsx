import { Link } from 'react-router-dom';
import type { ModelName, TaskStatus } from '../../data/schema/core';
import { Badge } from '../../components/atom/Badge/Badge';
import { Chip } from '../../components/atom/Chip/Chip';
import { MODEL_TONE } from './taskModel';

/** R-K02: the model that does the task, one distinct tone each. */
export const ModelBadge = ({ model, size = 'sm' }: { model: ModelName; size?: 'sm' | 'md' }) => <Badge tone={MODEL_TONE[model]} size={size}>{model}</Badge>;
/** R-K03: the lane, coloured from the --status-<key>-* tokens. */
export const StatusBadge = ({ status, label, size = 'sm' }: { status: TaskStatus; label: string; size?: 'sm' | 'md' }) => <Badge status={status} size={size}>{label}</Badge>;
/** Page codes the task ships, each linking to its page doc. */
export const CodeChips = ({ codes }: { codes: string[] }) => (codes.length ? <>{codes.map((c) => <Chip key={c}>{c}</Chip>)}</> : null);
/** A dependency id as a link to its task detail. */
export const TaskLink = ({ id, title }: { id: string; title?: string }) => <Link to={`/plan/tasks/${id}`} className="pl-tasklink" title={title}><code>{id}</code></Link>;
