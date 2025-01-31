import { ref } from 'vue';
import { useStorage } from './storage';
import { format } from 'date-fns';

export interface EmailMessage {
  fromName: string;
  subject: string;
  date: string;
  message: string;
  isUnread: boolean;
}

const messagePool: EmailMessage[] = [
  {
    fromName: 'Matt Chorsey',
    subject: 'New event: Trip to Vegas',
    date: format(new Date(), 'MMM dd, yyyy h:mmaa'),
    message:
      "Target rich environment nobody's fault it could have been managed better. Drill down you gotta smoke test your hypothesis product launch, and nail jelly to the hothouse wall spinning our wheels rock Star/Ninja. I don't like the corporate synergy.",
    isUnread: true,
  },
  {
    fromName: 'Lauren Ruthford',
    subject: 'Long time no chat',
    date: format(new Date(), 'MMM dd, yyyy h:mmaa'),
    message:
      'Pull in ten extra bodies to help roll the tortoise upstream selling, but strategic high-level 30,000 ft view. Introduction of a tentative event rundown is attached for your reference, including other happenings on the day.',
    isUnread: true,
  },
  {
    fromName: 'Jordan Firth',
    subject: 'Report Results',
    date: format(new Date(), 'MMM dd, yyyy h:mmaa'),
    message:
      'Touch base. Game plan we need distributors to evangelize the new line to local markets, yet target rich environment, or get all your ducks in a row, so window of opportunity. Where the metal hits the meat, we need to leverage our synergies.',
    isUnread: true,
  },
  {
    fromName: 'Bill Thomas',
    subject: 'The situation',
    date: format(new Date(), 'MMM dd, yyyy h:mmaa'),
    message:
      "Net net market-facing slipstream, yet we need to get all stakeholders up to speed and in the right place synergize productive mindfulness, for let's not solutionize this right now parking lot it.",
    isUnread: true,
  },
  {
    fromName: 'Joanne Pollan',
    subject: 'Updated invitation: Swim lessons',
    date: format(new Date(), 'MMM dd, yyyy h:mmaa'),
    message:
      "Bells and whistles UI I'm sorry I replied to your emails after only three weeks, but can the site go live tomorrow anyway? The right info at the right time to the right people quick win. This vendor is incompetent.",
    isUnread: true,
  },
  {
    fromName: 'Andrea Cornerston',
    subject: 'Last minute ask',
    date: format(new Date(), 'MMM dd, yyyy h:mmaa'),
    message:
      "Spinning our wheels can we parallel path not enough bandwidth deploy. Both the angel on my left shoulder and the devil on my right are eager to go to the next board meeting and say we're ditching the business model back of the net, so it's a simple lift and shift job.",
    isUnread: true,
  },
  {
    fromName: 'Moe Chamont',
    subject: 'Family Calendar App - Version 1',
    date: format(new Date(), 'MMM dd, yyyy h:mmaa'),
    message:
      'Please advise soonest per my previous email, but run it up the flag pole. Best practices can you slack it to me? Thought shower back-end of third quarter, nor criticality. Out of the loop red flag in this space golden goose, commitment to the caus. Critical mass high touch client, hop on the bandwagon.',
    isUnread: true,
  },
  {
    fromName: 'Kelly Richardson',
    subject: 'Placeholder Headhots',
    date: format(new Date(), 'MMM dd, yyyy h:mmaa'),
    message:
      "Future-proof. It just needs more cowbell we don't want to boil the ocean, beef up. Blue sky code, yet make it a priority feed the algorithm level the playing field we need to crystallize a plan.",
    isUnread: true,
  },
];

const { initialize: initializeStorage, clear, getAll, getKeys, getValue, removeValue, setValue } = useStorage();

const messages = ref<EmailMessage[]>([]);

const setMessages = async () => (messages.value = [...(await getAll())].reverse().map((x) => x.value));

const addMessage = async () => {
  if (messages.value.length < messagePool.length) {
    const dt = Date.now();
    await setValue(dt, { ...messagePool[messages.value.length], date: format(dt, 'MMM dd, yyyy h:mmaa') });
    await setMessages();
  }
};

const getMessage = async (idx: number): Promise<EmailMessage | null> => {
  const keys = [...(await getKeys())].reverse();
  return idx < keys.length ? getValue(keys[idx]) : null;
};

const initialize = async () => {
  await initializeStorage();
  await setMessages();
};

const markRead = async (idx: number) => {
  const keys = [...(await getKeys())].reverse();
  if (idx < keys.length) {
    const email = await getValue(keys[idx]);
    await setValue(keys[idx], { ...email, isUnread: false });
    await setMessages();
  }
};

const removeAllMessages = async () => {
  await clear();
  await setMessages();
};

const removeMessage = async () => {
  if (messages.value.length) {
    const keys = await getKeys();
    await removeValue(keys[messages.value.length - 1]);
    await setMessages();
  }
};

export const useEmailMessages = () => ({
  messages,
  addMessage,
  getMessage,
  initialize,
  markRead,
  removeAllMessages,
  removeMessage,
});
