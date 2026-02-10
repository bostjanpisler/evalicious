"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step {
	instruction: string;
	tip?: string;
}

interface StepGroup {
	groupName?: string;
	items: Step[];
}

interface StepChecklistProps {
	groups: StepGroup[];
}

export function StepChecklist({ groups }: StepChecklistProps) {
	const [checked, setChecked] = useState<Set<string>>(new Set());

	const toggle = (id: string) => {
		setChecked((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const clearAll = () => setChecked(new Set());

	let stepCounter = 0;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="font-serif text-xl font-semibold">Instructions</h2>
				{checked.size > 0 && (
					<Button variant="ghost" size="sm" onClick={clearAll}>
						Clear all
					</Button>
				)}
			</div>
			{groups.map((group) => (
				<div key={group.groupName ?? "default"}>
					{group.groupName && (
						<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
							{group.groupName}
						</h3>
					)}
					<ol className="space-y-4">
						{group.items.map((item) => {
							stepCounter++;
							const id = `step-${stepCounter}`;
							const isChecked = checked.has(id);
							return (
								<li key={id} className="flex gap-3">
									<Checkbox
										id={id}
										checked={isChecked}
										onCheckedChange={() => toggle(id)}
										className="mt-1"
									/>
									<div className="flex-1">
										<label
											htmlFor={id}
											className={cn(
												"cursor-pointer leading-relaxed",
												isChecked && "text-muted-foreground line-through",
											)}
										>
											<span className="mr-2 font-semibold text-primary">
												{stepCounter}.
											</span>
											{item.instruction}
										</label>
										{item.tip && (
											<p className="mt-1 text-sm italic text-muted-foreground">
												Tip: {item.tip}
											</p>
										)}
									</div>
								</li>
							);
						})}
					</ol>
				</div>
			))}
		</div>
	);
}
