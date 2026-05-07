export function EmptyState({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="empty-state">
      <Icon size={32} />
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}

export function EmptyStateSm({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="empty-state-sm">
      <Icon size={18} />
      <span>{title}</span>
    </div>
  );
}
