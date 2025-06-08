import { Cable, Loader2, RotateCcwIcon, UnplugIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConnectedBoards } from "../hooks/useConnectedBoards";
import { useFormatBoards } from "../hooks/useFormatBoard";
import { ConfirmActionButton } from "@/components/composite/confirm-action-button";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { BAUD_RATES } from "../../../../main/common/constants";
import type { PortConnection } from "src/main/types";
import { useResetBoard } from "../hooks/useResetBoard";
import { Button } from "@/components/ui/button";

export default function BoardActionsContainer() {
  const { toast } = useToast();

  const [isConnecting, setIsConnecting] = useState(false);
  const [boardConnected, setBoardConnected] = useState(false);

  const [selectedBoardPath, setSelectedBoardPath] = useState<string | null>(
    null
  );

  const [selectedBaudRate, setSelectedBaudRate] = useState(BAUD_RATES[0]);
  const { boards } = useConnectedBoards();

  const { resetBoard, isLoading: isResettingBoard } = useResetBoard();

  const { formatBoard, isLoading: isFormattingBoard } = useFormatBoards({
    onError: () =>
      toast({
        title: "Failed to format the board.",
        variant: "destructive",
      }),
    onSuccess: () => {
      toast({
        title: "Board formatted successfully.",
      });
      connectToBoard();
    },
  });

  const handleDataReceivedFromPort = useCallback(
    (connection: PortConnection) => {
      if (connection.path !== selectedBoardPath) {
        setSelectedBoardPath(connection.path);
      }

      if (connection.baudRate !== selectedBaudRate) {
        setSelectedBaudRate(connection.baudRate);
      }
    },
    [selectedBoardPath, selectedBaudRate]
  );

  const connectToBoard = useCallback(async () => {
    if (selectedBaudRate && selectedBoardPath) {
      setIsConnecting(true);
      window.api.once("portOpened", () => setIsConnecting(false));
      await window.api.connectToBoard(selectedBoardPath, selectedBaudRate);
    }
  }, [selectedBaudRate, selectedBoardPath]);

  useEffect(() => {
    const { on } = window.api;

    const subsribers = [
      on("portOpened", handleDataReceivedFromPort),
      on("serialData", handleDataReceivedFromPort),
      on("portOpened", () => setBoardConnected(true)),
      on("portErrorOccured", () => setBoardConnected(false)),
      on("portClosed", () => setBoardConnected(false)),
    ];

    return () => {
      subsribers.forEach((unsub) => unsub());
    };
  }, []);

  const isExecutingProcessOnBoard = Boolean(
    isConnecting || isFormattingBoard || isResettingBoard
  );

  return (
    <>
      <div className="mb-2">
        <Label htmlFor="board">Board</Label>
        <Select
          name="board"
          value={selectedBoardPath || ""}
          disabled={boardConnected || isExecutingProcessOnBoard}
          onValueChange={(boardPath) => {
            setSelectedBoardPath(boardPath);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose board" />
          </SelectTrigger>
          <SelectContent>
            {boards.map((b) => (
              <SelectItem
                key={`board-choice-item-${b.path}`}
                value={b.path as string}
              >
                {b.path}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mb-2">
        <Label htmlFor="baud">Baud Rate</Label>
        <Select
          name="baud"
          value={String(selectedBaudRate)}
          disabled={boardConnected || isExecutingProcessOnBoard}
          onValueChange={(baudRate) => {
            setSelectedBaudRate(parseInt(baudRate, 10));
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose baud rate" />
          </SelectTrigger>
          <SelectContent>
            {BAUD_RATES.map((b) => (
              <SelectItem key={`baudrate-choice-item-${b}`} value={String(b)}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mb-2">
        <Button
          disabled={
            !selectedBoardPath || boardConnected || isExecutingProcessOnBoard
          }
          variant="default"
          onClick={async () => {
            if (selectedBoardPath) {
              await resetBoard(selectedBoardPath);
            }
          }}
          className="w-full"
        >
          <RotateCcwIcon /> Reset
        </Button>
      </div>
      <div className="mb-6">
        <Button
          disabled={!selectedBoardPath || isExecutingProcessOnBoard}
          variant="default"
          onClick={() => {
            if (boardConnected) {
              return window.api.disconnectBoard();
            }

            connectToBoard();
          }}
          className="w-full"
        >
          {isConnecting ? (
            <>
              <Loader2 className="animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              {boardConnected ? <UnplugIcon /> : <Cable />}
              {boardConnected ? "Disconnect" : "Connect"}
            </>
          )}
        </Button>
      </div>
      <Label>Board Actions</Label>
      <Tabs defaultValue="upload" className="justify-center">
        <TabsList className="w-full">
          <TabsTrigger
            className="flex-1"
            value="flash"
            disabled={isExecutingProcessOnBoard}
          >
            Flash
          </TabsTrigger>
          <TabsTrigger
            className="flex-1"
            value="format"
            disabled={isExecutingProcessOnBoard}
          >
            Format
          </TabsTrigger>
        </TabsList>
        <TabsContent value="flash">Flash</TabsContent>
        <TabsContent value="format" className="w-full flex justify-center mt-2">
          <ConfirmActionButton
            disabled={!selectedBoardPath || isFormattingBoard}
            openerLabel={
              isFormattingBoard ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Formatting...
                </>
              ) : (
                "Format Board"
              )
            }
            confirmationLabel="Are you sure you want to format the connected board?"
            onConfirm={async () => {
              if (selectedBoardPath) {
                await formatBoard(selectedBoardPath);
              }
            }}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
