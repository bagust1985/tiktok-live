"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, User as UserIcon } from "lucide-react";
import { formatIDR } from "@/lib/format";

interface NetworkNode {
  id: string;
  username: string;
  email: string;
  tier_level: number;
  is_active: boolean;
  position: string | null;
  balance_deposit: number;
  balance_available: number;
  left: NetworkNode | null;
  right: NetworkNode | null;
}

interface NetworkViewerProps {
  networkData: NetworkNode | null;
}

export default function NetworkViewer({ networkData }: NetworkViewerProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Auto expand root node
    if (networkData) {
      setExpandedNodes(new Set([networkData.id]));
    }
  }, [networkData]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getTierLabel = (tier: number) => {
    if (tier === 0) return "Free";
    if (tier === 1) return "L1";
    if (tier === 2) return "L2";
    if (tier === 3) return "L3";
    return `T${tier}`;
  };

  const renderNode = (node: NetworkNode | null, depth: number = 0): React.ReactNode => {
    if (!node) return null;

    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = !!(node.left || node.right);

    return (
      <div key={node.id} className="flex flex-col items-center">
        <div
          className={`relative p-3 border rounded-lg bg-card ${
            depth === 0 ? "border-primary shadow-md" : "border-border"
          }`}
          style={{ minWidth: "200px" }}
        >
          <div className="flex items-center gap-2 mb-2">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => toggleNode(node.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            <UserIcon className="h-4 w-4" />
            <span className="font-semibold text-sm">{node.username}</span>
            {node.position && (
              <Badge variant={node.position === "LEFT" ? "default" : "secondary"}>
                {node.position}
              </Badge>
            )}
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tier:</span>
              <Badge variant="outline">{getTierLabel(node.tier_level)}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              {node.is_active ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deposit:</span>
              <span className="font-medium">{formatIDR(node.balance_deposit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Available:</span>
              <span className="font-medium text-green-600">{formatIDR(node.balance_available)}</span>
            </div>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="flex gap-4 mt-4">
            <div className="flex flex-col items-center">
              {node.left && (
                <>
                  <div className="w-px h-4 bg-border mb-2" />
                  <div className="text-xs text-muted-foreground mb-1">LEFT</div>
                  {renderNode(node.left, depth + 1)}
                </>
              )}
            </div>
            <div className="flex flex-col items-center">
              {node.right && (
                <>
                  <div className="w-px h-4 bg-border mb-2" />
                  <div className="text-xs text-muted-foreground mb-1">RIGHT</div>
                  {renderNode(node.right, depth + 1)}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!networkData) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">No network data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Network Tree</CardTitle>
        <CardDescription>
          Binary network structure for {networkData.username}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {renderNode(networkData)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

